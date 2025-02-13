#!/bin/bash

# Check if a version argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Variables
VERSION=$1
IMAGE_NAME="abdulrahmanmahmoud/trex"

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t "$IMAGE_NAME:$VERSION" . || exit 1

# Step 2: Push the versioned image to Docker Hub
echo "Pushing versioned image to Docker Hub..."
docker push "$IMAGE_NAME:$VERSION" || exit 1

# Step 3: Tag the version as 'latest'
echo "Tagging the image as 'latest'..."
docker tag "$IMAGE_NAME:$VERSION" "$IMAGE_NAME:latest" || exit 1

# Step 4: Push the 'latest' image to Docker Hub
echo "Pushing 'latest' image to Docker Hub..."
docker push "$IMAGE_NAME:latest" || exit 1

# Step 5: Run the deployment command via SSH
DEPLOY_COMMAND="cd /root/.deploy/ && docker compose up --pull always -d"
echo "Running deployment command on the server..."
ssh root@145.223.99.154 "$DEPLOY_COMMAND"

echo "Deployment completed successfully."
