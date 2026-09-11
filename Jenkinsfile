pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "sumittiwari05/complaint-backend"
        FRONTEND_IMAGE = "sumittiwari05/complaint-frontend"

        DOCKER_CREDENTIALS = "dockerhub-creds"
        KUBE_CREDENTIALS   = "minikube-kubeconfig"
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

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    string(
                        credentialsId: "${KUBE_CREDENTIALS}",
                        variable: 'KUBECONFIG_CONTENT'
                    )
                ]) {
                    sh '''
                        set +x

                        printf '%s' "$KUBECONFIG_CONTENT" > kubeconfig

                        echo "kubeconfig file size"
                        wc -c kubeconfig


                        echo "kubeconfig line count:"
                        wc -l kubeconfig 

                        echo "testing kubeconfig:"
                        kubectl --kubeconfig="$WORKSPACE/kubeconfig" config current-context
                    
                    '''
                }
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
