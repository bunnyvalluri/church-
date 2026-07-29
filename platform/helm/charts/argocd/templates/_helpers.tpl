{{/*
Expand the name of the chart.
*/}}
{{- define "argocd.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "argocd.labels" -}}
helm.sh/chart: {{ include "argocd.name" . }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ include "argocd.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
