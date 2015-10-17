from fabric.api import env, local, run, cd, sudo, open_shell, settings

# Notes on setting up server before running this fabfile:
#   Must install node (which comes with npm) and git, and pm2 from npm
#   Installing Node: http://askubuntu.com/questions/672994/how-to-install-nodejs-4-on-ubuntu-15-04-64-bit-edition
#   Installing Git: https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-14-04
#   Fixing npm global install issues: https://docs.npmjs.com/getting-started/fixing-npm-permissions
#   Redirecting to port 80: http://richardfergie.com/redirect-port-80-to-a-different-port-using-iptables

env.user = ""
env.password = ""
env.hosts = ["classcapture1.cs.illinois.edu"]

git_base_url = "https://github.com/sourabhdesai/"
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
    cd(git_repo_name)
    run("git checkout origin master")
    run("npm install") # install package dependencies

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
    run("pm2 start app.js -i 0 -x -- --prod")

def deploy(user, password, shell_before=False, shell_after=True):
    env.user = user
    env.password = password
    test()
    if shell_before:
        open_shell()
    checkout()
    start_server()
    if shell_after:
        open_shell()
