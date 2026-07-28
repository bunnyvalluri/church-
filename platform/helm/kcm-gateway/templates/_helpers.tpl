{{/*
Expand the name of the chart.
*/}}
{{- define "kcm-gateway.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "kcm-gateway.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/part-of: kcm-church-portal
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "kcm-gateway.selectorLabels" -}}
app.kubernetes.io/name: {{ include "kcm-gateway.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
