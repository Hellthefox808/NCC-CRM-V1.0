# Integration Guide • 19 JHR BN Data SDK

## 1. Installation & Client Usage
Import the `EnterpriseDataPlatform` SDK and `useRealtimeData` hook into any React component:

```typescript
import { EnterpriseDataPlatform } from "./services/dataPlatform";
import { useRealtimeData } from "./hooks/useRealtimeData";

// Fetch paginated enrollments
const response = await EnterpriseDataPlatform.getEnrollments({
  status: "Submitted",
  gender: "SD"
});

// React Realtime Hook
const { isConnected, latencyMs } = useRealtimeData({
  channels: ["cadre:notifications"],
  onNotificationBroadcast: (notice) => {
    console.log("New Parade Order Received:", notice.title);
  }
});
```

## 2. Error Handling
All API calls reject with a typed `DataPlatformError`:
```typescript
try {
  await EnterpriseDataPlatform.submitEnrollment(data);
} catch (err) {
  if (err instanceof DataPlatformError) {
    console.error(`Error Code: ${err.code}, Status: ${err.status}, Request ID: ${err.requestId}`);
  }
}
```
