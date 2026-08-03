# INTEGRATION GUIDE • ENTERPRISE DATA PLATFORM v3000

---

## 1. Developer Setup & Overview

This guide explains how to integrate frontend React components with the **19 JHR BN NCC Enterprise Data Platform** using the `EnterpriseDataPlatform` SDK and `useRealtimeData` custom hook.

- **SDK Location**: [`src/services/dataPlatform.ts`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/src/services/dataPlatform.ts)
- **Realtime Hook Location**: [`src/hooks/useRealtimeData.ts`](file:///c:/Users/ravir/Desktop/PROJECT/Project/NCC/src/hooks/useRealtimeData.ts)
- **Author & Architect**: **Ravi Ranjan Singh**

---

## 2. Using the REST API SDK (`EnterpriseDataPlatform`)

### 2.1. Submitting a Cadet Application
```typescript
import { EnterpriseDataPlatform } from "../services/dataPlatform";

const handleSubmit = async (formData: Partial<CadetRecord>) => {
  try {
    const response = await EnterpriseDataPlatform.submitEnrollment(formData);
    if (response.success) {
      console.log("Application submitted:", response.data?.enrollment);
    }
  } catch (error) {
    console.error("Submission failed:", error);
  }
};
```

### 2.2. Tracking Application Status with Automatic Deduplication
```typescript
const checkStatus = async (query: string) => {
  try {
    const response = await EnterpriseDataPlatform.trackStatus(query);
    if (response.success) {
      setCadetRecord(response.data.record);
    }
  } catch (error) {
    console.error("Status check error:", error);
  }
};
```

### 2.3. Querying AI Subedar Major Assistant
```typescript
const askAi = async (userPrompt: string) => {
  const res = await EnterpriseDataPlatform.sendAiMessage(userPrompt);
  if (res.success) {
    setChatReply(res.data.reply);
  }
};
```

---

## 3. Integrating Real-Time WebSockets (`useRealtimeData`)

```typescript
import { useRealtimeData } from "../hooks/useRealtimeData";

export const NotificationsWidget = () => {
  const { isConnected, activePresenceCount, latencyMs } = useRealtimeData({
    onNotificationBroadcast: (newNotice) => {
      console.log("New Broadcast Received:", newNotice);
      // Trigger toast or update local state
    },
    onStatusUpdated: (updatedCadet) => {
      console.log("Cadet Status Changed:", updatedCadet);
    }
  });

  return (
    <div>
      <span>Status: {isConnected ? "CONNECTED" : "DISCONNECTED"}</span>
      <span>Active Cadets: {activePresenceCount}</span>
      <span>Latency: {latencyMs} ms</span>
    </div>
  );
};
```

---

## 4. Authorship

- **Author & Architect**: **Ravi Ranjan Singh**
- **Role**: Software Engineer • Software Architect • Full Stack Developer • AI SaaS Developer
