{{/*
Expand the name of the chart.
*/}}
{{- define "istio.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "istio.labels" -}}
helm.sh/chart: {{ include "istio.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "istio.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
