module SQLi;

export {
    redef enum Notice::Type += {
        SQL_Injection_Detected,
    };
}

# Function to check if a string contains a double quote
function contains_double_quote(s: string): bool {
    return /\"/ in s;
}

# This event is triggered for every HTTP request
event http_request(c: connection, method: string, original_URI: string, unescaped_URI: string, version: string) {
    # Print every request for debugging
    print fmt("SQLi-DEBUG: Checking URI: %s", original_URI);
    
    # EXTREMELY basic SQL injection detection - will catch almost anything
    local is_sqli = F;
    
    # Check for SQL keywords
    if (/select/ in to_lower(original_URI) || 
        /union/ in to_lower(original_URI) || 
        /insert/ in to_lower(original_URI) || 
        /update/ in to_lower(original_URI) || 
        /delete/ in to_lower(original_URI) || 
        /drop/ in to_lower(original_URI) || 
        /alter/ in to_lower(original_URI) || 
        /exec/ in to_lower(original_URI) || 
        /'/ in original_URI || 
        /;/ in original_URI || 
        /--/ in original_URI) {
        
        is_sqli = T;
    }
    
    # Check for double quotes - using a simpler approach
    # The backslash escapes the double quote in the pattern
    if (contains_double_quote(original_URI)) {
        is_sqli = T;
    }
    
    if (is_sqli) {
        print fmt("SQLi-DEBUG: DETECTED SQL INJECTION: %s", original_URI);
        
        NOTICE([$note=SQL_Injection_Detected,
                $conn=c,
                $msg=fmt("SQL Injection detected in URI: %s", original_URI),
                $identifier=cat(c$id$orig_h, c$id$resp_h),
                $suppress_for=30mins]);
    }
    
    # Special case for DVWA
    if (/vulnerabilities\/sqli/ in original_URI) {
        print fmt("SQLi-DEBUG: DVWA SQL page accessed: %s", original_URI);
        
        # Even more basic detection for DVWA
        local is_dvwa_sqli = F;
        
        # Check for single quote
        if (/'/ in original_URI || /=/ in original_URI) {
            is_dvwa_sqli = T;
        }
        
        # Check for double quote
        if (contains_double_quote(original_URI)) {
            is_dvwa_sqli = T;
        }
        
        if (is_dvwa_sqli) {
            print fmt("SQLi-DEBUG: DETECTED DVWA SQL INJECTION: %s", original_URI);
            
            NOTICE([$note=SQL_Injection_Detected,
                    $conn=c,
                    $msg=fmt("DVWA SQL Injection detected: %s", original_URI),
                    $identifier=cat(c$id$orig_h, c$id$resp_h),
                    $suppress_for=30mins]);
        }
    }
}

# Also check POST data
event http_entity_data(c: connection, is_orig: bool, length: count, data: string) {
    if (is_orig) {
        # Print POST data for debugging
        print fmt("SQLi-DEBUG: Checking POST data: %s", data);
        
        # Basic SQL injection detection in POST data
        local is_post_sqli = F;
        
        # Check for SQL keywords and special chars
        if (/select/ in to_lower(data) || 
            /union/ in to_lower(data) || 
            /insert/ in to_lower(data) || 
            /update/ in to_lower(data) || 
            /delete/ in to_lower(data) || 
            /drop/ in to_lower(data) || 
            /alter/ in to_lower(data) || 
            /exec/ in to_lower(data) || 
            /'/ in data || 
            /;/ in data || 
            /--/ in data) {
            
            is_post_sqli = T;
        }
        
        # Check for double quotes
        if (contains_double_quote(data)) {
            is_post_sqli = T;
        }
        
        if (is_post_sqli) {
            print fmt("SQLi-DEBUG: DETECTED SQL INJECTION IN POST: %s", data);
            
            NOTICE([$note=SQL_Injection_Detected,
                    $conn=c,
                    $msg=fmt("SQL Injection detected in POST data"),
                    $identifier=cat(c$id$orig_h, c$id$resp_h),
                    $suppress_for=30mins]);
        }
    }
}
