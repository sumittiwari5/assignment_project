after the installation of the docker and minikube.
we need to make docker the minikube driver, by running command :

minikube config set driver docker

# then start kubernetes by command :
minikube start --driver=docker

# The important thing is that we are using:
# --driver=docker
# rather than the none driver. The Docker driver is considerably simpler and does not require us to configure Kubernetes directly on the EC2 host.

# ========================
# before apply kubernetes we need to Create the ConfigMap :
# with command :
kubectl create configmap postgres-init \
  --from-file=init.sql=database/init.sql

# expected : configmap/postgres-init created

# verify :
kubectl get configmap postgres-init
# then:
kubectl describe configmap postgres-init

# apply the postgresSql :
kubectl apply -f k8s/postgres.yaml
