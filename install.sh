#!/bin/bash

sudo apt update
sudo apt upgrade -y

sudo apt install tree curl unzip tar git apt-transport-https ca-certificates gnupg lsb-release

sudo apt update

sudo apt install -y docker.io

sudo systemctl enable docker

sudo usermod -aG docker ubuntu

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb

sudo dpkg -i minikube_latest_amd64.deb

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

