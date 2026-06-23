# Firebase Map Project Hardening Checklist

## Current Architecture

- React 19 + Vite
- JavaScript
- React Leaflet
- Firebase Auth
- Firebase Firestore
- Firebase Hosting
- GitHub
- Tailwind CSS

---

# Priority 1 - Critical Risks

## 1. Firestore Security Rules
- Admin can create/update/delete.
- Viewer can only read.
- Anonymous access disabled.
- Validate required fields in rules.

## 2. Validation Layer
Create `src/validators`.
Validate dealer name, phone, status, coordinates, monthly sales.

## 3. Audit Log
Create collection `audit_logs`.
Store user, action, timestamp, oldData, newData.

## 4. Soft Delete
Use deleted=true instead of permanent deletion.

## 5. Backup Strategy
Daily export dealers, products, sales and users.

---

# Priority 2 - Stability

## Error Boundary
Prevent full application crashes.

## Marker Validation
Validate lat/lng before rendering.

## Environment Separation
Use separate Firebase projects for DEV and PROD.

## Schema Versioning
Add schemaVersion field for future migrations.

---

# Priority 3 - Monitoring

## Error Tracking
Use Sentry or Firebase monitoring.

## Logging
Track login, create, update and delete actions.

---

# Priority 4 - Testing

## Business Logic Tests
- Status filtering
- Sales calculations
- Validation
- Import/export

## Map Tests
- Marker rendering
- Cluster rendering
- Popup rendering
- Invalid coordinates

---

# Features That Impress Customers

1. Excel Import
2. Excel Export
3. Powerful Search
4. Fullscreen Presentation Mode
5. Dashboard Statistics
6. Activity Timeline
7. Audit History
8. Reliable Backup
9. Fast Map Performance
10. Stable Data Management

---

# Final Priority Order

1. Firestore Security Rules
2. Backup Strategy
3. Audit Log
4. Validation Layer
5. Excel Import/Export
6. Dashboard
7. Fullscreen Presentation Mode
8. Monitoring
