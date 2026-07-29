{{/*
Expand the name of the chart.
*/}}
{{- define "trivy.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "trivy.labels" -}}
helm.sh/chart: {{ include "trivy.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "trivy.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
