#!/bin/bash
# this script will filter out comments from javascripts
# current version is unfinished ...

CTX='';

function myecholine()

{
declare -i N;
BSL=\\;

N=0;
L=$1;
C=${L:${N}:2};
while [[ ! ( "${C}" == "" ) ]]; 
  do  
  # echo -n -E ${C};
  case ${CTX} in
  '') if [[ "${C}" == "//" ]];
      then break;
      elif [[ "${C}" == '/*' ]];
      then N=$(($N+1)); CTX='/*';
      else
       if  [[ "${C}" == \"* ]];
       then CTX='"';
       elif [[ "${C}" == \'* ]];
       then CTX="'"; 
       fi;
      printf "%c"  "${C:0:1}" ; 
      fi;;
  '/*') if   [[ "${C}" == '*/' ]]; then CTX=''; N=$(($N+1)); fi ;;
  \"  ) printf "%c"  "${C:0:1}" ; if [[ "${C}" == \"* ]]; then CTX=''; fi ;;
  \'  ) printf "%c"  "${C:0:1}" ; if [[ "${C}" == \'* ]]; then CTX=''; fi ;;
  esac
  N=$(($N+1));  
  C="${L:${N}:2}";
  done;   
if [[ !("${CTX}" == '/*') ]]; then echo; fi; 
}

read -r LINE; 
END=$?;
while [[ ${END} == 0 ]] ;
  do
    # echo -E \ "$LINE";
    myecholine "$LINE"; 
    read -r LINE ;
    END=$?;
  done;


