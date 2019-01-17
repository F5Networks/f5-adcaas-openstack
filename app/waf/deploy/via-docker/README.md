**Usage:**

0. Verify `docker` has been installed and running.
1. Run `./start_all.sh` to start:
   * postgres container, listens at 5432.
   * application container, listens at 3000. 
   * Run `./start_pg.sh` to start postgres only; 
   * Run `./start_app.sh` to start application only.
2. Run `./stop_all.sh` to stop and remove the docker container. 
3. [Optional] Customize your running process by editing `settings` file.
