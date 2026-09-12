pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "sumittiwari05/complaint-backend"
        FRONTEND_IMAGE = "sumittiwari05/complaint-frontend"

        DOCKER_CREDENTIALS = "dockerhub-creds"
        POSTGRES_CREDENTIALS = "postgres-db-credentials"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                sh '''
                    python3 -m py_compile backend/app.py backend/models.py
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build \
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend

                    docker build \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | \
                            docker login \
                            -u "$DOCKER_USERNAME" \
                            --password-stdin

                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${BACKEND_IMAGE}:latest

                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Create Kubernetes Secret'){
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${POSTGRES_CREDENTIALS}",
                        usernameVariable: 'POSTGRES_USER',
                        passwordVariable: 'POSTGRES_PASSWORD'
                    )
                ]) {
                    sh '''
                        export KUBECONFIG=/var/lib/jenkins/jenkins-kubeconfig

                        DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/complaint_db"

                        kubectl create secret generic postgres-secret \
                            --from-literal=POSTGRES_DB=complaint_db \
                            --from-literal=POSTGRES_USER="$POSTGRES_USER" \
                            --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
                            --from-literal=DATABASE_URL="$DATABASE_URL" \
                            --dry-run=client \
                            -o yaml | kubectl apply -f -
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    export KUBECONFIG=/var/lib/jenkins/jenkins-kubeconfig

                    kubectl apply -f k8s/backend.yaml
                    kubectl apply -f k8s/frontend.yaml

                    kubectl set image deployment/backend \
                        backend=${BACKEND_IMAGE}:${BUILD_NUMBER}

                    kubectl set image deployment/frontend \
                        frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER}

                    kubectl rollout status deployment/backend --timeout=120s
                    kubectl rollout status deployment/frontend --timeout=120s
                    
                    kubectl get pods
                    kubectl get services
                '''
            }
        }
    }

    post {
        always {
            sh '''
                rm -f kubeconfig
            '''
        }
    }
}
