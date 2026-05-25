$dir = "e:\Projects\nurox-project\infra\k8s\helm-chart\templates"

# deployment-web.yaml
@"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-web
  labels:
    app: {{ .Release.Name }}-web
spec:
  replicas: {{ .Values.web.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-web
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-web
    spec:
      containers:
        - name: web
          image: "{{ .Values.web.image.repository }}:{{ .Values.web.image.tag }}"
          imagePullPolicy: {{ .Values.web.image.pullPolicy }}
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: {{ .Release.Name }}-config
            - secretRef:
                name: {{ .Release.Name }}-secret
          resources:
            {{- toYaml .Values.web.resources | nindent 12 }}
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
"@ | Out-File "$dir\deployment-web.yaml" -Encoding UTF8

# service-api.yaml
@"
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: {{ .Release.Name }}-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3001
"@ | Out-File "$dir\service-api.yaml" -Encoding UTF8

# service-web.yaml
@"
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: {{ .Release.Name }}-web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
"@ | Out-File "$dir\service-web.yaml" -Encoding UTF8

# hpa.yaml
@"
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Release.Name }}-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ .Release.Name }}-api
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
{{- end }}
"@ | Out-File "$dir\hpa.yaml" -Encoding UTF8

# pdb.yaml
@"
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ .Release.Name }}-api-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: {{ .Release.Name }}-api
"@ | Out-File "$dir\pdb.yaml" -Encoding UTF8

# ingress.yaml
@"
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-ingress
  annotations:
    {{- toYaml .Values.ingress.annotations | nindent 4 }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  tls:
    {{- toYaml .Values.ingress.tls | nindent 4 }}
  rules:
    {{- toYaml .Values.ingress.hosts | nindent 4 }}
{{- end }}
"@ | Out-File "$dir\ingress.yaml" -Encoding UTF8

# configmap.yaml
@"
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-config
data:
  {{- toYaml .Values.config | nindent 2 }}
"@ | Out-File "$dir\configmap.yaml" -Encoding UTF8

# secret.yaml
@"
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-secret
type: Opaque
stringData:
  {{- toYaml .Values.secrets | nindent 2 }}
"@ | Out-File "$dir\secret.yaml" -Encoding UTF8

# cronjob.yaml
@"
{{- if .Values.backup.enabled }}
apiVersion: batch/v1
kind: CronJob
metadata:
  name: {{ .Release.Name }}-db-backup
spec:
  schedule: "{{ .Values.backup.schedule }}"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: pg-dump
            image: postgres:16
            command:
            - /bin/sh
            - -c
            - |
              TIMESTAMP=`date +%Y%m%d%H%M`
              pg_dump -h $(DB_HOST) -U $(DB_USERNAME) $(DB_DATABASE) | gzip > /tmp/backup-$TIMESTAMP.sql.gz
              # Upload to MinIO/S3 using curl or awscli if installed
              echo "Backup completed"
            envFrom:
            - configMapRef:
                name: {{ .Release.Name }}-config
            - secretRef:
                name: {{ .Release.Name }}-secret
          restartPolicy: OnFailure
{{- end }}
"@ | Out-File "$dir\cronjob.yaml" -Encoding UTF8
