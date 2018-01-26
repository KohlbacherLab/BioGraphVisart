#!/bin/bash

HCC_SUBGRAPHS="/share/projects/HCCMultiscale/subgraphs"
BINDIR="$HCC_SUBGRAPHS/bin"

BASE_PATIENT=$1
declare -a ALL_PATIENTS=("S02" "S05" "S06" "S07" "S11")

SCORES="$HCC_SUBGRAPHS/scores/${BASE_PATIENT}/${BASE_PATIENT}_rnaseq_vcf.csv"
GRAPH="$HCC_SUBGRAPHS/graphs/kegg/kegg_all_interactions.graphml"
RECEPTORS="$HCC_SUBGRAPHS/layers/lxr_merge_entrez.txt"
TERMINALS="$HCC_SUBGRAPHS/layers/sorafenib_targets_entrez.txt"

echo "Finding subgraphs..."

avgdrgnt.py --scores ${SCORES} \
	    --score-column rnaseq_abs_log2fold_gt2_OR_vcf_incoming_OR_outgoing \
	    --sep comma \
	    --receptors-file ${RECEPTORS} \
	    --terminals-file ${TERMINALS} \
	    --graph ${GRAPH} \
	    --min-size 5 \
	    --algorithm gcc

echo "Mapping attributes..."	    
	    
$BINDIR/annotate_with_layers.py optimal.graphml
$BINDIR/annotate_with_scores.py optimal.graphml ${SCORES}
$BINDIR/expand_kegg.py optimal.graphml

echo "Mapping other patients..."

mkdir -p mapping
for p in "${ALL_PATIENTS[@]}"
do
    mkdir -p mapping/$p
    SCORES="$HCC_SUBGRAPHS/scores/$p/${p}_rnaseq_vcf.csv"
    $BINDIR/map_subgraph_to_other_patient.py optimal.graphml ${SCORES}
    mv optimal_mapped.graphml mapping/$p
done	

rm -r mapping/$BASE_PATIENT
