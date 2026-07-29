{{/*
Expand the name of the chart.
*/}}
{{- define "falco.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "falco.labels" -}}
helm.sh/chart: {{ include "falco.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "falco.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
