module AttackDetection;

export {
    redef enum Notice::Type += {
        SQL_Injection,
        XSS_Attack,
        Command_Injection,
        Path_Traversal,
        Suspicious_User_Agent,
        HTTP_Header_Attack,
    };
    
    # Track DVWA sessions
    global dvwa_sessions: table[string] of bool = table();
    
    # Track seen attacks to prevent duplicates
    global seen_sqli: table[conn_id] of bool &default=F;
    
    # Function to decode URL-encoded strings (simplified)
    function url_decode(s: string): string
    {
        local result = s;
        # Replace common URL encodings - using proper regex patterns
        result = gsub(result, /%20/, " ");
        result = gsub(result, /%27/, "'");
        result = gsub(result, /%22/, "\"");
        result = gsub(result, /%3D/, "=");
        result = gsub(result, /%2B/, "+");
        result = gsub(result, /%3B/, ";");
        return result;
    }
}

# Track DVWA authentication and detect attacks
event http_request(c: connection, method: string, original_URI: string, unescaped_URI: string, version: string) {
    local lower_uri = to_lower(unescaped_URI);
    local decoded_uri = url_decode(unescaped_URI);
    local lower_decoded = to_lower(decoded_uri);
    
    # Log all HTTP requests for debugging
    print fmt("HTTP Request: %s %s", method, original_URI);
    print fmt("Decoded URI: %s", decoded_uri);
    
    # Track DVWA login attempts
    if (/login\.php/ in original_URI && method == "POST") {
        # Mark this session as potentially authenticated to DVWA
        dvwa_sessions[c$uid] = T;
        print fmt("Potential DVWA login detected: %s", c$uid);
    }
    
    # DVWA-specific detection for vulnerable pages
    if (/vulnerabilities\/(sqli|xss|csrf|exec|upload|brute|fi|captcha)/ in original_URI) {
        print fmt("DVWA vulnerable page accessed: %s", original_URI);
        dvwa_sessions[c$uid] = T;
    }
    
    # SUPER AGGRESSIVE SQL Injection detection - will catch almost anything
    if (/['"]/ in lower_uri || 
        /\bor\b/ in lower_uri || 
        /\bunion\b/ in lower_uri || 
        /\bselect\b/ in lower_uri ||
        /\bfrom\b/ in lower_uri ||
        /\bwhere\b/ in lower_uri ||
        /--/ in lower_uri ||
        /#/ in lower_uri ||
        /\*/ in lower_uri ||
        /;/ in lower_uri ||
        /=/ in lower_uri ||
        /\+/ in lower_uri ||
        /\/\*/ in lower_uri ||
        /\*\// in lower_uri ||
        # Also check decoded URI
        /['"]/ in lower_decoded || 
        /\bor\b/ in lower_decoded || 
        /\bunion\b/ in lower_decoded || 
        /\bselect\b/ in lower_decoded ||
        /\bfrom\b/ in lower_decoded ||
        /\bwhere\b/ in lower_decoded ||
        /--/ in lower_decoded ||
        /#/ in lower_decoded ||
        /\*/ in lower_decoded ||
        /;/ in lower_decoded ||
        /=/ in lower_decoded ||
        /\+/ in lower_decoded ||
        /\/\*/ in lower_decoded ||
        /\*\// in lower_decoded) {
        
        if (c$id !in seen_sqli) {
            seen_sqli[c$id] = T;
            print fmt("SQL INJECTION DETECTED: %s", original_URI);
            print fmt("Decoded URI: %s", decoded_uri);
            
            NOTICE([$note=SQL_Injection,
                    $conn=c,
                    $msg=fmt("SQL Injection detected: %s", original_URI),
                    $identifier=cat(c$id$orig_h, c$id$resp_h),
                    $suppress_for=30mins]);
        }
    }
    
    # SIMPLIFIED XSS patterns
    if (/script/ in lower_uri || 
        /javascript/ in lower_uri || 
        /onerror/ in lower_uri || 
        /onload/ in lower_uri || 
        /alert\(/ in lower_uri ||
        /</ in lower_uri) {
        
        print fmt("XSS ATTACK DETECTED: %s", original_URI);
        
        NOTICE([$note=XSS_Attack,
                $conn=c,
                $msg=fmt("XSS attack detected: %s", original_URI),
                $identifier=cat(c$id$orig_h, c$id$resp_h),
                $suppress_for=30mins]);
    }
    
    # SIMPLIFIED Command Injection patterns
    if (/;/ in lower_uri || 
        /\|/ in lower_uri || 
        /\$\(/ in lower_uri || 
        /`/ in lower_uri) {
        
        print fmt("COMMAND INJECTION DETECTED: %s", original_URI);
        
        NOTICE([$note=Command_Injection,
                $conn=c,
                $msg=fmt("Command injection detected: %s", original_URI),
                $identifier=cat(c$id$orig_h, c$id$resp_h),
                $suppress_for=30mins]);
    }
    
    # SIMPLIFIED Path Traversal patterns
    if (/\.\./ in lower_uri || 
        /etc/ in lower_uri || 
        /passwd/ in lower_uri || 
        /boot\.ini/ in lower_uri) {
        
        print fmt("PATH TRAVERSAL DETECTED: %s", original_URI);
        
        NOTICE([$note=Path_Traversal,
                $conn=c,
                $msg=fmt("Path traversal detected: %s", original_URI),
                $identifier=cat(c$id$orig_h, c$id$resp_h),
                $suppress_for=30mins]);
    }
}

# Log all HTTP headers for debugging
event http_header(c: connection, is_orig: bool, name: string, value: string) {
    if (is_orig) {
        print fmt("HTTP Header: %s: %s", name, value);
        
        # Check for DVWA session cookies
        if (name == "COOKIE" && /PHPSESSID/ in value) {
            print fmt("DVWA session cookie detected: %s", value);
            # Mark this connection as having a DVWA session
            dvwa_sessions[c$uid] = T;
        }
        
        # Check for SQL injection in headers
        local lower_value = to_lower(value);
        local header_decoded = url_decode(value);
        local header_lower_decoded = to_lower(header_decoded);
        
        # SUPER AGGRESSIVE SQL injection detection in headers
        if (/['"]/ in lower_value || 
            /\bor\b/ in lower_value || 
            /\bunion\b/ in lower_value || 
            /\bselect\b/ in lower_value ||
            /--/ in lower_value ||
            /#/ in lower_value ||
            /\*/ in lower_value ||
            /;/ in lower_value ||
            /=/ in lower_value ||
            /\+/ in lower_value ||
            # Also check decoded value
            /['"]/ in header_lower_decoded || 
            /\bor\b/ in header_lower_decoded || 
            /\bunion\b/ in header_lower_decoded || 
            /\bselect\b/ in header_lower_decoded ||
            /--/ in header_lower_decoded ||
            /#/ in header_lower_decoded ||
            /\*/ in header_lower_decoded ||
            /;/ in header_lower_decoded ||
            /=/ in header_lower_decoded ||
            /\+/ in header_lower_decoded) {
            
            if (c$id !in seen_sqli) {
                seen_sqli[c$id] = T;
                print fmt("SQL INJECTION DETECTED IN HEADER %s: %s", name, value);
                
                NOTICE([$note=SQL_Injection,
                        $conn=c,
                        $msg=fmt("SQL Injection in header %s: %s", name, value),
                        $identifier=cat(c$id$orig_h, c$id$resp_h),
                        $suppress_for=30mins]);
            }
        }
        
        # Suspicious User Agent detection - SIMPLIFIED
        if (name == "USER-AGENT" && 
            (/sqlmap/ in to_lower(value) || 
             /nikto/ in to_lower(value) || 
             /nessus/ in to_lower(value) || 
             /nmap/ in to_lower(value))) {
            
            print fmt("SUSPICIOUS USER AGENT DETECTED: %s", value);
            
            NOTICE([$note=Suspicious_User_Agent,
                    $conn=c,
                    $msg=fmt("Suspicious User-Agent: %s", value),
                    $identifier=cat(c$id$orig_h, c$id$resp_h),
                    $suppress_for=30mins]);
        }
        
        # HTTP Header Attack detection - SIMPLIFIED
        if ((to_lower(name) == "x-forwarded-for" || 
             to_lower(name) == "host") && 
            (/;/ in to_lower(value) || 
             /\|/ in to_lower(value))) {
            
            print fmt("HTTP HEADER ATTACK DETECTED: %s: %s", name, value);
            
            NOTICE([$note=HTTP_Header_Attack,
                    $conn=c,
                    $msg=fmt("HTTP Header Injection: %s: %s", name, value),
                    $identifier=cat(c$id$orig_h, c$id$resp_h),
                    $suppress_for=30mins]);
        }
    }
}

# Also check POST data for attacks
event http_entity_data(c: connection, is_orig: bool, length: count, data: string) {
    if (is_orig) {
        local lower_data = to_lower(data);
        local post_decoded = url_decode(data);
        local post_lower_decoded = to_lower(post_decoded);
        
        print fmt("HTTP POST Data: %s", data);
        print fmt("Decoded POST Data: %s", post_decoded);
        
        # Check for DVWA login data
        if (/username=admin&password=password/ in data && /login\.php/ in c$http$uri) {
            print fmt("DVWA login detected: %s", c$uid);
            dvwa_sessions[c$uid] = T;
        }
        
        # SUPER AGGRESSIVE SQL Injection in POST data
        if (/['"]/ in lower_data || 
            /\bor\b/ in lower_data || 
            /\bunion\b/ in lower_data || 
            /\bselect\b/ in lower_data ||
            /\bfrom\b/ in lower_data ||
            /\bwhere\b/ in lower_data ||
            /--/ in lower_data ||
            /#/ in lower_data ||
            /\*/ in lower_data ||
            /;/ in lower_data ||
            /=/ in lower_data ||
            /\+/ in lower_data ||
            /\/\*/ in lower_data ||
            /\*\// in lower_data ||
            # Also check decoded data
            /['"]/ in post_lower_decoded || 
            /\bor\b/ in post_lower_decoded || 
            /\bunion\b/ in post_lower_decoded || 
            /\bselect\b/ in post_lower_decoded ||
            /\bfrom\b/ in post_lower_decoded ||
            /\bwhere\b/ in post_lower_decoded ||
            /--/ in post_lower_decoded ||
            /#/ in post_lower_decoded ||
            /\*/ in post_lower_decoded ||
            /;/ in post_lower_decoded ||
            /=/ in post_lower_decoded ||
            /\+/ in post_lower_decoded ||
            /\/\*/ in post_lower_decoded ||
            /\*\// in post_lower_decoded) {
            
            if (c$id !in seen_sqli) {
                seen_sqli[c$id] = T;
                print fmt("SQL INJECTION DETECTED IN POST DATA: %s", data);
                
                NOTICE([$note=SQL_Injection,
                        $conn=c,
                        $msg=fmt("SQL Injection in POST data"),
                        $identifier=cat(c$id$orig_h, c$id$resp_h),
                        $suppress_for=30mins]);
            }
        }
        
        # XSS in POST data
        if (/script/ in lower_data || 
            /javascript/ in lower_data || 
            /onerror/ in lower_data || 
            /onload/ in lower_data || 
            /alert\(/ in lower_data ||
            /</ in lower_data) {
            
            print fmt("XSS ATTACK DETECTED IN POST DATA: %s", data);
            
            NOTICE([$note=XSS_Attack,
                    $conn=c,
                    $msg=fmt("XSS attack in POST data"),
                    $identifier=cat(c$id$orig_h, c$id$resp_h),
                    $suppress_for=30mins]);
        }
    }
}
