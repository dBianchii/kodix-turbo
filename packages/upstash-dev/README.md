To run the dev script without needing to input the sudo password on linux:

Let's say you are using the user sally...

```bash
sudo groupadd docker
sudo usermod -aG docker sally
su - sally
```

Then, restart linux
