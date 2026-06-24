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

## 1. Firestore Security Rules [✅ DONE]
- Admin can create/update/delete.
- Viewer can only read.
- Anonymous access disabled.
- Validate required fields in rules.

## 2. Validation Layer [✅ DONE]
Create `src/validators`.
Validate dealer name, phone, status, coordinates, monthly sales.

## 3. Audit Log [✅ DONE]
Create collection `audit_logs`.
Store user, action, timestamp, oldData, newData.
*(Lưu ý từ User: Không cần làm UI, chỉ cần lưu DB là đủ)*

## 4. Soft Delete [✅ DONE]
Use deleted=true instead of permanent deletion.

## 5. Backup Strategy [❌ SKIPPED]
Daily export dealers, products, sales and users.
*(User quyết định: chưa cần làm lúc này)*

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

1. Powerful Search [✅ DONE]
2. Fullscreen Presentation Mode [✅ DONE]
3. Dashboard Statistics [✅ DONE]
4. Activity Timeline [❌ SKIPPED]
5. Audit History [❌ SKIPPED]
6. Reliable Backup [❌ SKIPPED]
7. Fast Map Performance [✅ DONE]
8. Stable Data Management [✅ DONE]

---

# Final Priority Order

1. ~~Firestore Security Rules~~ (Đã hoàn thành)
2. ~~Backup Strategy~~ (Chưa cần làm)
3. ~~Audit Log~~ (Đã hoàn thành)
4. ~~Validation Layer~~ (Đã hoàn thành)
5. ~~Dashboard~~ (Đã hoàn thành)
6. ~~Fullscreen Presentation Mode~~ (Đã hoàn thành)
7. Monitoring (Sentry/Crashlytics)
