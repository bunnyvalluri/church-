# Envoy Gateway Access Logging Standard

## Access Log Format
Envoy Gateway generates structured access logs for HTTPRoutes and Ingress traffic:

```json
{
  "start_time": "%START_TIME%",
  "method": "%REQ(:METHOD)%",
  "path": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
  "protocol": "%PROTOCOL%",
  "response_code": "%RESPONSE_CODE%",
  "response_flags": "%RESPONSE_FLAGS%",
  "bytes_received": "%BYTES_RECEIVED%",
  "bytes_sent": "%BYTES_SENT%",
  "duration_ms": "%DURATION%",
  "upstream_service": "%UPSTREAM_HOST%",
  "user_agent": "%REQ(USER-AGENT)%",
  "x_forwarded_for": "%REQ(X-FORWARDED-FOR)%",
  "x_request_id": "%REQ(X-REQUEST-ID)%"
}
```
