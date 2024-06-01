git clone --single-branch --branch dev https://gitlab.bc.gotbit.io/bc/pepega-team/whitelabel-projs/gotbit-ui-kit __TEMP__
rm -rf src/components/gotbit-ui-kit
mv __TEMP__/src/components/gotbit-ui-kit src/components
rm -rf __TEMP__