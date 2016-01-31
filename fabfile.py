from fabric.api import env, local, run, cd, sudo, open_shell, settings
from fabric.operations import prompt
from fabric.contrib.files import append


# Notes on setting up server before running this fabfile:
#   Must install node (which comes with npm) and git, and pm2 from npm
#   Installing Node: http://askubuntu.com/questions/672994/how-to-install-nodejs-4-on-ubuntu-15-04-64-bit-edition
#   Installing Git: https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-14-04
#   ---- Helpful links during deployment ----
#   Fixing npm global install issues: https://docs.npmjs.com/getting-started/fixing-npm-permissions
#   Redirecting to port 80: http://richardfergie.com/redirect-port-80-to-a-different-port-using-iptables
#   Deployment with SailsJS: http://sailsjs.org/documentation/concepts/deployment
#   Creating a Postgres DB on the VM: https://help.ubuntu.com/community/PostgreSQL

env.user = ""
env.password = ""
env.hosts = ["classcapture1.cs.illinois.edu"]

git_base_url = "https://github.com/cs-education/"
git_repo_name = "ClassCapture_HTTPServer"
videos_dir = "~/classcapture_videos"

def test():
    """
    runs tests locally
    """
    local("npm test")

def checkout():
    """
    Checkout the code on the VM, install npm/bower dependencies
    Also, changes current directory to the checked out repo
    """
    must_clone_repo = False
    with settings(warn_only=True): # makes it so that `test -d <dirname>` won't cause an interruption if it fails
        must_clone_repo = run("test -d %s" % git_repo_name).failed
    if must_clone_repo:
        run("git clone %s%s.git" % (git_base_url, git_repo_name))

    with cd("~/%s" % git_repo_name):
        run("git pull origin master")
        run("npm install") # install package dependencies

    if must_clone_repo:
        write_env() # write the .env file which will contain all sensitive data regarding database connection

def write_env():
    print "Must write vars to '.env' file"
    # Defaults are for development vm
    prompt('DB_HOST=', 'DB_HOST', default='localhost')
    prompt('DB_USER=', 'DB_USER', default='vmuser')
    prompt('DB_PASSWORD=', 'DB_PASSWORD', default='freshhook19')
    prompt('DB_NAME=', 'DB_NAME', default='classcapture')
    env_kv_list = ["DB_HOST=%s" % env.DB_HOST, "DB_USER=%s" % env.DB_USER, "DB_PASSWORD=%s" % env.DB_PASSWORD, "DB_NAME=%s" % env.DB_NAME]
    with cd("~/%s" % git_repo_name):
        run("touch .env")
        append(".env", env_kv_list) # add all lines to the .env file
        run("cat .env")

def start_server():
    """
    First check if video directory exists, make it if it doesn't
    Start the server on the VM
    uses pm2 to start & manager cluster of server processes
    """
    must_create_videos_dir = False
    with settings(warn_only=True): # makes it so that `test -d <dirname>` won't cause an interruption if it fails
        must_create_videos_dir = run("test -d %s" % videos_dir).failed
    if must_create_videos_dir:
        run("mkdir %s" % videos_dir)
    with cd("~/%s" % git_repo_name):
        run("pm2 start app.json")

def reload_server(user, password, shell_after=True):
    env.user = user
    env.password = password

    checkout()
    with cd("~/%s" % git_repo_name):
        run("pm2 reload app.json")
    if shell_after:
        open_shell()

def deploy(user, password, do_test=False, shell_before=False, shell_after=True):
    env.user = user
    env.password = password

    if do_test:
        test()

    if shell_before:
        open_shell()

    checkout()
    start_server()
    if shell_after:
        open_shell()
