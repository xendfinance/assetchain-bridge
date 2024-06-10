1)
# Clone your project and navigate to the xend-multitoken directory
##### Build the backend as a Docker image. You will have 5 backends for different networks.
# !!!!!!!!!!! Repeat the following actions for each backend directory:
# For each {backend_dir}, you have 5 paths: backend (this for net RWA), backend-usdc, backend-usdt, backend-weth, backend-wnt.
# For      {private_key}, specify the private key appropriate to the network for your backend.
export BACKEND_DIR={backend_dir} 
export PRIVATE_KEY={private_key}
cd $BACKEND_DIR
docker build -t $BACKEND_DIR .
cd ..

2)
##### build static frontend: You must have node version v16.20.2 and yarn version 1.22.19
cd frontend
# install package
yarn
# Set the environment variables, where {link_backend} is the link to your specific backend.
export VITE_BACKEND_LINK_RWA=https://{link_backend_rwa}
export VITE_BACKEND_LINK_USDC=https://{link_backend_usdc}
export VITE_BACKEND_LINK_USDT=https://{link_backend_usdt}
export VITE_BACKEND_LINK_WETH=https://{link_backend_weth}
export VITE_BACKEND_LINK_WNT=https://{link_backend_wnt}
# build static
yarn build
# Your static files are dist path
ls dist
