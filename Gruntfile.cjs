module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['build']
        },
        exec: {
            tsc: 'npm exec tsc',
            build_docker: 'docker build -t <%= pkg.name %>:latest -t <%= pkg.name %>:<%= pkg.version %> .',
            clean_docker: 'docker kill puppyguard || echo no container to clean',
            start_docker: 'docker run --name <%= pkg.name %> --rm <%= pkg.name %>:latest'
        }
    })

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-clean');


    grunt.registerTask('default', ['clean:build', 'exec:tsc', 'exec:build_docker'])
    grunt.registerTask('start', ['default', 'exec:clean_docker', 'exec:start_docker'])
}