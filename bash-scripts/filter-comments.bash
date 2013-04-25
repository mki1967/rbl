#!/bin/bash
# this script will filter out comments from javascripts
# current version is unfinished ...

function myecholine()

{
declare -i N;
BSL=\\;
N=0;
L=$1;
C=${L:${N}:1};
while [[ ! ( "${C}" == "" ) ]]; 
  do  
  # echo -n -E ${C};
  printf "%c"  "$C\ " 
  N=$(($N+1));  
  C="${L:${N}:1}";
  done;   
echo; 
}

read -r LINE; 
END=$?;
while [[ ${END} == 0 ]] ;
  do
    echo -E \ "$LINE";
    # myecholine "$LINE"; 
    read -r LINE ;
    END=$?;
  done;


