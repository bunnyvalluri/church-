{{/*
Expand the name of the chart.
*/}}
{{- define "prometheus.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "prometheus.labels" -}}
helm.sh/chart: {{ include "prometheus.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "prometheus.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
