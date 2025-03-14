import sys
from pathlib import Path
import cobra
import json
import math
from functools import reduce

def remove_biomass_func(model: cobra.Model) -> cobra.Model:
  # Check if the reaction exists and remove it
  print(model.objective)
  #model.reactions.get_by_id(reaction_id).remove_from_model()
  a = [x for x in model.reactions if x.objective_coefficient == 1]
  model.remove_reactions(a)
  print(f"Reaction '{a}' removed.")
  print("------------------------------------")
  return model 

def get_non_integer_reactions(model: cobra.Model) -> list[cobra.Reaction]:
  l: list[cobra.Reaction] = []
  for reaction in model.reactions:
    for (metabolite, stoich) in reaction.metabolites.items():
      if int(stoich) != stoich:
        l.append(reaction)
  return l


def convert_stoichiometry(model: cobra.Model, gcd = False) -> cobra.Model:
  for reaction in get_non_integer_reactions(model):
      print(reaction)
      coefficients = reaction.metabolites.values()
      # TODO: Think more about negative coefficients
      smallest_coeff = min(list(map(abs, coefficients)))
      print(smallest_coeff)
      exponent = round(math.log10(1/smallest_coeff)) + 1
      factor = 10**exponent
      new_reaction = reaction * factor
      if gcd:
        gcd = reduce(math.gcd,list(map(lambda x: abs(int(x)), new_reaction.metabolites.values())))
        new_reaction = new_reaction * (1/gcd)
      model.remove_reactions([reaction])
      model.add_reactions([new_reaction])
      print(reaction)
  return model

def find_by_property(data, key, value):
    return next((item for item in data if item.get(key) == value), None)

def check_metabolite_connections(model, metabolite_id):
    metabolite = model.metabolites.get_by_id(metabolite_id)
    print(f"Metabolite: {metabolite.name}")
    for reaction in metabolite.reactions:
        print(f" - Reaction: {reaction.id} ({reaction.name})")
        if metabolite in reaction.reactants:
            print(f"   Reactant in: {reaction.id}")
        if metabolite in reaction.products:
            print(f"   Product in: {reaction.id}")

def load_model(file: Path):
  
  # Load the SBML file
  model = cobra.io.read_sbml_model(file)
  
  # Display basic information about the model
  print(f"Model ID: {model.id}")
  print(f"Number of Reactions: {len(model.reactions)}")
  print(f"Number of Metabolites: {len(model.metabolites)}")
  print(f"Number of Genes: {len(model.genes)}")
  
  # Optional: Display a summary of the model
  model.summary()
  return model

# Writte by ChatGTP
# Adaptep by me
def convert(model: cobra.Model):
    # Initialize the data structure
    data = {
        "counter": 0,
        "shapes": []
    }

    # Helper function to create a shape
    def create_shape(shape_id, label, x, y, shape_type, arc_ids, tokens = 10):
        shape = {
            "id": shape_id,
            "x": x,
            "y": y,
            "label": label,
            "fillColor": "blue",
            "isSelected": False,
            "arcStart": True,
            "arcEnd": True,
            "arcIDS": arc_ids,
            "tokens": tokens,
            "radius": 10 if shape_type == "Circle" else None,
            "width": 20 if shape_type == "Rectangle" else None,
            "height": 50 if shape_type == "Rectangle" else None,
            "type": shape_type,
            "canFire": False if shape_type == "Rectangle" else None
        }
        return shape
    def create_arc(arc_id, start_id, end_id, weight = 1):
        arc = {
                "id": arc_id,
                "label": "",
                "fillColor": "blue",
                "isSelected": False,
                "arcStart": False,
                "arcEnd": False,
                "startID": start_id,
                "endID": end_id, 
                "type": "Arc",
                "edgeWeight": abs(int(weight))
            }
        return arc


    # Create shapes for metabolites
    metabolite_ids = {}
    for i, metabolite in enumerate(model.metabolites):
        shape_id = data["counter"]
        metabolite_ids[metabolite.id] = shape_id
        shape = create_shape(shape_id, metabolite.id, 100 * (i % 10), 100 * (i // 10), "Circle", [], 10)
        data["shapes"].append(shape)
        data["counter"] += 1
    MAT = cobra.util.create_stoichiometric_matrix(model, array_type = "DataFrame")
    print(MAT)
    print(MAT.index)
    # Create shapes for reactions and arcs
    for reaction in model.reactions:
        # Create reverse reaction
        if not reaction.id.startswith("EX_") and (reaction.reversibility == True or (reaction.lower_bound < 0 and reaction.upper_bound > 0)): 
          shape_id = data["counter"]
          reaction_id = shape_id
          shape = create_shape(shape_id, "REV_" + reaction.name, 100 * (shape_id % 10), 100 * (shape_id // 10) + 50, "Rectangle", [])
          data["shapes"].append(shape)
          data["counter"] += 1
        
        shape_id = data["counter"]
        reaction_id = shape_id
        shape = create_shape(shape_id, reaction.name, 100 * (shape_id % 10), 100 * (shape_id // 10) + 50, "Rectangle", [])
        data["shapes"].append(shape)
        data["counter"] += 1



        # Create arcs for reactants
        # TODO I think we can merge this code into one loop
        for reactant in reaction.reactants:
            arc_id = data["counter"]
            # Create an arc for each reactant_place to the reaction
            arc = None
            print("FROM", reaction.id , "TO", reactant.id)
            weight = MAT.loc[reactant.id, reaction.id]
            print(weight)
            if reaction.id.startswith("EX_") and reaction.upper_bound == 0 and reaction.lower_bound < 0:
              # This reactions takes up stuff (aka generates out of nothing) (source)
              arc = create_arc(arc_id,  reaction_id, metabolite_ids[reactant.id], weight)
              met = find_by_property(data["shapes"], "id", metabolite_ids[reactant.id])
              met["tokens"] = -1 * reaction.lower_bound
              #print("REACTION IS UPTAKE")
              data["shapes"].append(arc)
              data["counter"] += 1
              data["shapes"][metabolite_ids[reactant.id]]["arcIDS"].append(arc_id)
              data["shapes"][reaction_id]["arcIDS"].append(arc_id)
            elif reaction.id.startswith("EX_") and reaction.upper_bound > 0 and reaction.lower_bound == 0:
              # This reactions pumps stuff (aka pumps into nothing) (sink)
              #print(f'REACTION {reaction.id} IS SINK')
              arc = create_arc(arc_id, metabolite_ids[reactant.id], reaction_id, weight)
              met = find_by_property(data["shapes"], "id", metabolite_ids[reactant.id])
              met["tokens"] = 0
              data["shapes"].append(arc)
              data["counter"] += 1
              data["shapes"][metabolite_ids[reactant.id]]["arcIDS"].append(arc_id)
              data["shapes"][reaction_id]["arcIDS"].append(arc_id)
            elif reaction.id.startswith("EX_"):
              # ELSE we have a reversible ex reaction                           
              arc = create_arc(arc_id, metabolite_ids[reactant.id], reaction_id, weight)
              #print(f"REVERSIBLE  {reaction.id} EX REACTION")
              met = find_by_property(data["shapes"], "id", metabolite_ids[reactant.id])
              met["tokens"] = -1 * reaction.lower_bound
              data["shapes"].append(arc)
              data["counter"] += 1
              data["shapes"][metabolite_ids[reactant.id]]["arcIDS"].append(arc_id)
              data["shapes"][reaction_id]["arcIDS"].append(arc_id)


              shape_id = data["counter"]
              reaction_id = shape_id
              shape = create_shape(shape_id, "REV_" + reaction.name, 100 * (shape_id % 10), 100 * (shape_id // 10) + 50, "Rectangle", [])
              data["shapes"].append(shape)
              data["counter"] += 1
              
              arc_id = data["counter"]
              arcR = create_arc(arc_id,  reaction_id, metabolite_ids[reactant.id], weight)
              data["shapes"].append(arcR)
              data["counter"] += 1
              data["shapes"][metabolite_ids[reactant.id]]["arcIDS"].append(arc_id)
              data["shapes"][reaction_id]["arcIDS"].append(arc_id)

            else:
              arc = create_arc(arc_id, metabolite_ids[reactant.id], reaction_id, weight)
              data["shapes"].append(arc)
              data["counter"] += 1
              data["shapes"][metabolite_ids[reactant.id]]["arcIDS"].append(arc_id)
              data["shapes"][reaction_id]["arcIDS"].append(arc_id)
              print(reaction_id)

        # Create arcs for products
        for product in reaction.products:
            arc_id = data["counter"]
            # Create an arc for reaction to each product place
            print("FROM", reaction.id , "TO", product.id)
            weight = MAT.loc[product.id, reaction.id]
            print(weight)
            arc =  create_arc(arc_id, reaction_id, metabolite_ids[product.id], weight)
            data["shapes"].append(arc)
            data["counter"] += 1
            data["shapes"][reaction_id]["arcIDS"].append(arc_id)
            data["shapes"][metabolite_ids[product.id]]["arcIDS"].append(arc_id)

    return data







if __name__ == '__main__':
  print(f'INPUT <smbfile>  <outputname>')
  #sys.argv[1] = "../../sbml_examples/e_coli_core.xml"
  if len(sys.argv) < 3: 
    print("Please provide 2 arguments.")

  input_file: Path = Path(sys.argv[1])
  output_file: Path = Path(sys.argv[2])


  model = load_model(input_file)
  # The biomass function has non-integer stoichiometry
  # Thus we remove it for now
  model = remove_biomass_func(model)
  # There are also other reactions with non-integer stoichiometry
  model = convert_stoichiometry(model, gcd = True)
  assert(get_non_integer_reactions(model) == [])
  custom_json = convert(model)



  with open(output_file, "w") as outfile:
      json.dump(custom_json, outfile, indent=2)


  #check_metabolite_connections(model, "fru26bp_c")
