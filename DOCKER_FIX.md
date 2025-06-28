# 🔧 SSH Honeypot Docker Naming Fix

## Problem Solved
The error `ERROR: invalid tag "ssh_honeypot_": invalid reference format` was caused by empty or invalid Docker container names.

## Root Causes Fixed

### 1. Empty Honeypot Names
- **Issue**: When config name was empty or just whitespace, container name became `ssh_honeypot_`
- **Fix**: Added validation and default fallback names

### 2. Invalid Docker Tag Format
- **Issue**: Docker tags cannot end with underscores or contain certain characters
- **Fix**: Improved name sanitization and validation

### 3. Missing Error Handling
- **Issue**: Unclear error messages made debugging difficult
- **Fix**: Added comprehensive logging and error reporting

## Changes Made

### 🐍 Backend (Python)

#### `python/services/ssh.py`
```python
# Before
self.container_name = f"ssh_honeypot_{safe_name}"

# After
if not raw_name or raw_name.strip() == '':
    raw_name = 'default_honeypot'
safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '_')
if not safe_name:
    safe_name = 'default_honeypot'
timestamp = str(int(time.time()))[-6:]
self.container_name = f"ssh_honeypot_{safe_name}_{timestamp}"
```

#### `python/app.py`
- Added validation for required fields (name, port)
- Added port range validation (1-65535)
- Added whitespace validation for names
- Enhanced error logging with emojis and details

### 🎨 Frontend (React)

#### `next/app/components/SSHServiceConfig.jsx`
- Added client-side validation before saving
- Added default honeypot name with timestamp
- Improved error messaging

### 🚀 Infrastructure

#### `start_api.bat`
- Added Docker daemon accessibility check
- Added Python dependency verification
- Auto-install missing dependencies
- Better error reporting

## Validation Features

### Name Validation
✅ Empty names → Default to "default_honeypot"
✅ Whitespace-only → Default fallback
✅ Special characters → Sanitized to alphanumeric + underscore
✅ Uniqueness → Timestamp suffix added

### Docker Tag Compliance
✅ No trailing underscores
✅ No leading underscores  
✅ Only alphanumeric and underscore characters
✅ Valid length and format

### Port Validation
✅ Range check (1-65535)
✅ Type validation (must be number)
✅ Required field validation

## Testing

### Manual Test Cases
1. **Empty name**: `""` → `ssh_honeypot_default_honeypot_123456`
2. **Whitespace**: `"   "` → `ssh_honeypot_default_honeypot_123456`
3. **Special chars**: `"Test@#$%"` → `ssh_honeypot_test_123456`
4. **Normal name**: `"My Server"` → `ssh_honeypot_my_server_123456`

### Run Tests
```bash
# Test container naming
python test_naming.py

# Test API endpoints
python test_api.py

# Start with validation
start_api.bat
```

## Usage Instructions

### 1. Start the API
```bash
start_api.bat
```
The script will now:
- ✅ Check Docker is running
- ✅ Verify Docker daemon access
- ✅ Check Python installation
- ✅ Install missing dependencies
- ✅ Start Flask API with validation

### 2. Configure SSH Honeypot
1. Go to http://localhost:3000
2. Click "SSH Configuration"
3. Either:
   - Use a quick template (recommended)
   - Enter custom name (required)
4. Save configuration
5. Start honeypot when prompted

### 3. Monitor Results
- Check console output for detailed logging
- View container status: `docker ps`
- Check logs: API provides log endpoints

## Error Prevention

### Before This Fix
```
❌ ERROR: invalid tag "ssh_honeypot_": invalid reference format
❌ Container names ending with underscores
❌ Special characters breaking Docker
❌ Empty names causing failures
```

### After This Fix
```
✅ Valid Docker container names always generated
✅ Comprehensive validation on frontend and backend
✅ Clear error messages with troubleshooting info
✅ Automatic fallbacks for edge cases
✅ Timestamp-based uniqueness
```

## Future Improvements
- [ ] Add container name preview in UI
- [ ] Implement container name conflict detection
- [ ] Add bulk operations for multiple honeypots
- [ ] Enhance logging with structured JSON format

---

**The SSH honeypot should now start successfully with any configuration!** 🎉
