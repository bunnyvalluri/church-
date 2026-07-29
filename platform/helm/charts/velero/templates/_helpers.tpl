{{/*
Expand the name of the chart.
*/}}
{{- define "velero.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "velero.labels" -}}
helm.sh/chart: {{ include "velero.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "velero.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
