#!/bin/bash
# joke_grabber.sh
# Author: Maxime Lafarie
# Website: https://maximelafarie.com
# Version: 0.1.0
# Description: Grab a joke from an external public API and inject it in README file.

echo "Create README.md"
joke=$(curl -s https://official-joke-api.appspot.com/jokes/programming/random)

##
# Grab joke in the array
##
joke=$(echo $joke | jq .[0])

setup=$( echo $joke | jq -r '.setup' )
punchline=$( echo $joke | jq -r '.punchline' )
echo "${setup} ${punchline} 🤡" > README.md
