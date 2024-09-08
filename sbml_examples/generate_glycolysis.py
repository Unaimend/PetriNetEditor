import cobra
import numpy as np
from cobra import Model, Reaction, Metabolite
# Initialize the model
model = Model('Glycolysis')
# Define the metabolites
glucose = Metabolite('glc__D_c', formula='C6H12O6', name='D-Glucose', compartment='c')
glucose6p = Metabolite('g6p_c', formula='C6H11O9P', name='Glucose 6-phosphate', compartment='c')
fructose6p = Metabolite('f6p_c', formula='C6H11O9P', name='Fructose 6-phosphate', compartment='c')
fructose16bp = Metabolite('fdp_c', formula='C6H10O12P2', name='Fructose 1,6-bisphosphate', compartment='c')
dhap = Metabolite('dhap_c', formula='C3H5O6P', name='Dihydroxyacetone phosphate', compartment='c')
g3p = Metabolite('g3p_c', formula='C3H5O6P', name='Glyceraldehyde 3-phosphate', compartment='c')
bpg13 = Metabolite('13dpg_c', formula='C3H4O10P2', name='1,3-Bisphosphoglycerate', compartment='c')
pg3 = Metabolite('3pg_c', formula='C3H5O7P', name='3-Phosphoglycerate', compartment='c')
pg2 = Metabolite('2pg_c', formula='C3H5O7P', name='2-Phosphoglycerate', compartment='c')
pep = Metabolite('pep_c', formula='C3H2O6P', name='Phosphoenolpyruvate', compartment='c')
pyruvate = Metabolite('pyr_c', formula='C3H3O3', name='Pyruvate', compartment='c')
atp = Metabolite('atp_c', formula='C10H12N5O13P3', name='ATP', compartment='c')
adp = Metabolite('adp_c', formula='C10H12N5O10P2', name='ADP', compartment='c')
nad = Metabolite('nad_c', formula='C21H26N7O14P2', name='NAD+', compartment='c')
nadh = Metabolite('nadh_c', formula='C21H27N7O14P2', name='NADH', compartment='c')
pi = Metabolite('pi_c', formula='HO4P', name='Phosphate', compartment='c')
# Define the reactions


reaction11 = Reaction('EX_ATP')
reaction11.name = 'ATP_EXchange'
reaction11.lower_bound = -1000  
reaction11.upper_bound = 1000
reaction11.add_metabolites({
    atp: -1.0,
})

# CAN ONLY BE TAKEN UP
reaction12 = Reaction('EX_GLC')
reaction12.name = 'GLC_EXchange'
reaction12.lower_bound = -1000  
reaction12.upper_bound = 0
reaction12.add_metabolites({
    glucose: -1.0,
})

# CAN ONLY BE EXPORTED
reaction13 = Reaction('EX_PYR')
reaction13.name = 'PYR_EXchange'
reaction13.lower_bound = 0
reaction13.upper_bound = 1000
reaction13.add_metabolites({
    pyruvate: -1.0,
})

# THIS ONE CAN BE EXPORTED OR TAKEN UP
reaction15 = Reaction('EX_ADP')
reaction15.name = 'ADP_Ex'
reaction15.lower_bound = -1000
reaction15.upper_bound = 1000
reaction15.add_metabolites({
    adp: -1.0,
})

# THIS ONE IS BS
reaction16 = Reaction('EX_NAD')
reaction16.name = 'NAD_Ex'
reaction16.lower_bound = -1000
reaction16.upper_bound = 1000
reaction16.add_metabolites({
    nad: -1.0,
})

# CAN ONLY BE EXPORTED
reaction17 = Reaction('EX_PI')
reaction17.name = 'PI_Ex'
reaction17.lower_bound =-1000
reaction17.upper_bound = 1000
reaction17.add_metabolites({
    pi: -1.0,
})

# THIS ONE IS BS
reaction18 = Reaction('EX_NADH')
reaction18.name = 'NADH_Ex'
reaction18.lower_bound = -1000
reaction18.upper_bound = 1000
reaction18.add_metabolites({
  nadh: -1.0,
})

reaction1 = Reaction('HEX1')
reaction1.name = 'Hexokinase'
reaction1.subsystem = 'Glycolysis'
reaction1.lower_bound = 0  # irreversible
reaction1.upper_bound = 1000
reaction1.add_metabolites({
    glucose: -1.0,
    atp: -1.0,
    glucose6p: 1.0,
    adp: 1.0,
})

reaction2 = Reaction('PGI')
reaction2.name = 'Phosphoglucose isomerase'
reaction2.subsystem = 'Glycolysis'
reaction2.lower_bound = -1000  # reversible
reaction2.upper_bound = 1000
reaction2.add_metabolites({
    glucose6p: -1.0,
    fructose6p: 1.0,
})

reaction3 = Reaction('PFK')
reaction3.name = 'Phosphofructokinase'
reaction3.subsystem = 'Glycolysis'
reaction3.lower_bound = 0  # irreversible
reaction3.upper_bound = 1000
reaction3.add_metabolites({
    fructose6p: -1.0,
    atp: -1.0,
    fructose16bp: 1.0,
    adp: 1.0,
})

reaction4 = Reaction('FBA')
reaction4.name = 'Fructose-bisphosphate aldolase'
reaction4.subsystem = 'Glycolysis'
reaction4.lower_bound = 0  # irreversible
reaction4.upper_bound = 1000
reaction4.add_metabolites({
    fructose16bp: -1.0,
    dhap: 1.0,
    g3p: 1.0,
})
reaction5 = Reaction('TPI')
reaction5.name = 'Triosephosphate isomerase'
reaction5.subsystem = 'Glycolysis'
reaction5.lower_bound = -1000  # reversible
reaction5.upper_bound = 1000
reaction5.add_metabolites({
    dhap: -1.0,
    g3p: 1.0,
})

reaction6 = Reaction('GAPD')
reaction6.name = 'Glyceraldehyde 3-phosphate dehydrogenase'
reaction6.subsystem = 'Glycolysis'
reaction6.lower_bound = -1000  # reversible
reaction6.upper_bound = 1000
reaction6.add_metabolites({
    g3p: -1.0,
    nad: -1.0,
    pi: -1.0,
    bpg13: 1.0,
    nadh: 1.0,
})

reaction7 = Reaction('PGK')
reaction7.name = 'Phosphoglycerate kinase'
reaction7.subsystem = 'Glycolysis'
reaction7.lower_bound = -1000  # reversible
reaction7.upper_bound = 1000
reaction7.add_metabolites({
    bpg13: -1.0,
    adp: -1.0,
    pg3: 1.0,
    atp: 1.0,
})


reaction8 = Reaction('PGM')
reaction8.name = 'Phosphoglycerate mutase'
reaction8.subsystem = 'Glycolysis'
reaction8.lower_bound = -1000  # reversible
reaction8.upper_bound = 1000
reaction8.add_metabolites({
    pg3: -1.0,
    pg2: 1.0,
})
reaction9 = Reaction('ENO')
reaction9.name = 'Enolase'
reaction9.subsystem = 'Glycolysis'
reaction9.lower_bound = -1000  # reversible
reaction9.upper_bound = 1000
reaction9.add_metabolites({
    pg2: -1.0,
    pep: 1.0,
})


reaction10 = Reaction('PYK')
reaction10.name = 'Pyruvate kinase'
reaction10.subsystem = 'Glycolysis'
reaction10.lower_bound = 0# irreversible
reaction10.upper_bound = 1000
reaction10.add_metabolites({
    pep: -1.0,
    adp: -1.0,
    pyruvate: 1.0,
    atp: 1.0,
})


model.add_reactions([reaction1, reaction2, reaction3, reaction4, reaction5, reaction6, reaction7, reaction8, reaction9, reaction10, reaction11, reaction12, reaction13,  reaction15, reaction16,  reaction17, reaction18])

# Optionally, set an objective
model.objective = 'EX_PYR'

S = cobra.util.array.create_stoichiometric_matrix(model)
S2 = cobra.util.array.create_stoichiometric_matrix(model, array_type = "DataFrame")

NS = cobra.util.array.nullspace(S)
print(S)
print(S2)
print(NS)

cobra.io.write_sbml_model(model, "Glycolysis_selfmade.xml")
# Run the optimization
solution = model.optimize()
# Output results
print(f"Objective value: {solution.objective_value}")
print(solution.fluxes)
