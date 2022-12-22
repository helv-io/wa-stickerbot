pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                echo 'Hello world, this is multibranch pipeline for Dev branch'
            }
        }
        stage('test') {
            steps {
                echo 'testing Dev...'
            }
        }
        stage('deploy') {
            steps {
                echo 'deploying Dev...'
            }
        }
    }
}   