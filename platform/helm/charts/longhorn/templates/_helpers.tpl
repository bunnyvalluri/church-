{{/*
Expand the name of the chart.
*/}}
{{- define "longhorn.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "longhorn.labels" -}}
helm.sh/chart: {{ include "longhorn.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "longhorn.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
