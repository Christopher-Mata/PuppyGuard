module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['build']
        },
        exec: {
            tsc: 'npm exec tsc',
            build_docker: 'docker build ' + 
            '-t <%= pkg.name %>:latest ' + 
            '-t <%= pkg.name %>:<%= pkg.version %> ' + 
            '-t registry.fallon.io:443/<%= pkg.name %>:<%= pkg.version %> ' + 
            '-t registry.fallon.io:443/<%= pkg.name %>:latest .',
            clean_docker: 'docker kill puppyguard || echo no container to clean',
            start_docker: 'docker run --name <%= pkg.name %> --rm <%= pkg.name %>:latest',
            deploy_docker: 'docker push registry.fallon.io:443/<%= pkg.name %>:<%= pkg.version %> && docker push registry.fallon.io:443/<%= pkg.name %>:latest'
        }
    })

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-clean');


    grunt.registerTask('build', ['clean:build', 'exec:tsc', 'exec:build_docker'])
    grunt.registerTask('start', ['build', 'exec:clean_docker', 'exec:start_docker'])
    grunt.registerTask('deploy', ['build', 'exec:deploy_docker'])
    grunt.registerTask('default', ['build'])
}