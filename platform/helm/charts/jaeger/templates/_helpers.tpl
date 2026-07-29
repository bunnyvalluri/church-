{{/*
Expand the name of the chart.
*/}}
{{- define "jaeger.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "jaeger.labels" -}}
helm.sh/chart: {{ include "jaeger.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "jaeger.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
