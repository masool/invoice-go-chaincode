cd hcl/javascript/src/

  if [ -d "wallet" ]; then
  chmod 777 wallet
  rm -rf wallet
  echo "wallet folder deleted"
  else 
  echo "wallet folder not found"
  fi

sleep 2
echo
echo "installing node modules"
npm install
echo

sleep 2
echo "run enroll admin for hcl ADMIN fo org1"
node enrollAdmin_org1.js
echo
echo "run enroll admin for hcl ADMIN fo org2"
node enrollAdmin_org2.js
echo
sleep 2
echo "Run register user for hcl USER for org1"
node registerUser_org1.js
echo
echo "Run register user for hcl USER for org2"
node registerUser_org2.js
echo
echo "start npm"
echo
# pm2 start app.js
npm start