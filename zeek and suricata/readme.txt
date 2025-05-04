# File location

Suricata:
enable.conf -> /etc/suricata/enable.conf
suricata.yaml -> /etc/suricata/suricata.yaml

Zeek:
node.cfg -> /opt/zeek/etc/node.cfg
networks.cfg -> /opt/zeek/etc/networks.cfg
local.zeek -> /opt/zeek/share/zeek/site/local.zeek
attack-detection.zeek -> /opt/zeek/share/zeek/site/custom/attack-detection.zeek
sql-injection.zeek -> /opt/zeek/share/zeek/site/custom/sql-injection.zeek

Logstash:
suricata.conf -> /etc/logstash/conf.d/suricata.conf
zeek.conf -> /etc/logstash/conf.d/zeek.conf
logstash.conf -> /etc/logstash/conf.d/logstash.conf

Filebeat:
filebeat.yml -> /etc/filebeat/filebeat.yml

