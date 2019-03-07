#!/usr/bin/env bash

HOST=${GRAPHVIS_HOST:-localhost}
PORT=${GRAPHVIS_PORT:-3001}

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

TESTDATA=$SCRIPTPATH/data
CONTINUOUS_SCORE_EXAMPLES=$TESTDATA/continuous_scores
DISCRETE_SCORE_EXAMPLES=$TESTDATA/discrete_scores
PNGPATH=$SCRIPTPATH/png 

rm -rf $PNGPATH
mkdir -p $PNGPATH/continuous_scores
mkdir -p $PNGPATH/discrete_scores

for graphml in $CONTINUOUS_SCORE_EXAMPLES/*.graphml; do 
  curl -X GET \
       -H "Content-Type: application/xml" \
       -d @$graphml http://$HOST:$PORT/png > $PNGPATH/continuous_scores/$(basename $graphml).png
done

for graphml in $DISCRETE_SCORE_EXAMPLES/*.graphml; do 
  curl -X GET \
       -H "Content-Type: application/xml" \
       -d @$graphml http://$HOST:$PORT/png > $PNGPATH/discrete_scores/$(basename $graphml).png
done
