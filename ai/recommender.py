user = {
	"interests": ["culture", "food"],
	"budget": 50
}

places = [
	{
		"name": "Art Museum",
		"category": "culture",
		"price": 25
	},
		{
		"name": "Italian Restaurant",
		"category": "food",
		"price": 70
	},
		{
		"name": "Night Club",
		"category": "nightlife",
		"price": 60
	},
]

for place in places:
	if place["category"] in user["interests"] and place["price"] <= user["budget"]:
		print(place["name"])

# print(user)
# print(places)