import pandas as pd

# loading Data
data = pd.read_csv("ai/google_review_ratings_data.csv")

# removing empty column
data = data.drop(columns=["Unnamed: 25"])
# creating proper names for categories
data = data.rename(columns={
	"User": "user_id",
	"Category 1" : "churches",
	"Category 2" : "resorts",
	"Category 3" : "beaches",
	"Category 4" : "parks",
	"Category 5" : "theatres",
	"Category 6" : "museums",
	"Category 7" : "malls",
	"Category 8" : "zoo",
	"Category 9" : "restaurants",
	"Category 10" : "pubs_bars",
	"Category 11" : "local services",
	"Category 12" : "burger_pizza",
	"Category 13" : "hotels",
	"Category 14" : "juice_bars",
	"Category 15" : "art_galleries",
	"Category 16" : "dance_clubs",
	"Category 17" : "swimming_pools",
	"Category 18" : "gyms",
	"Category 19" : "bakeries",
	"Category 20" : "beauty_spas",
	"Category 21" : "cafes",
	"Category 22" : "view_points",
	"Category 23" : "monuments",
	"Category 24" : "gardens"
})

# splitting data into two sets (training data and test data)
ratings = data.drop(columns=["user_id"])

# converting all ratings to numeric values
ratings = ratings.apply(pd.to_numeric, errors="coerce")

# keeping only valid ratings (1-5)
valid_ratings = ratings.where(
	(ratings >=1) & (ratings <=5)
)

# Users with all ratings completed
complete_mask = valid_ratings.notna().all(axis=1)

# reference group
reference_users = valid_ratings.loc[~complete_mask].copy()

# test group
test_users = valid_ratings.loc[complete_mask].copy()

def calculate_distance(user_a, user_b):
	# finding categories rated by both users
	common = user_a.notna() & user_b.notna()
	if common.sum() <3:
	   return None 

	difference = (user_a[common] - user_b[common]).abs().mean()

	return difference

user_a = reference_users.iloc[0]
user_b = reference_users.iloc[1]

distance = calculate_distance(user_a, user_b)

# finding 5 simular users
test_user = test_users.iloc[0].copy()
actual_rating = test_user["cafes"]
test_user["cafes"] = float("nan")
print("Actual cafes rating (hidden): ", actual_rating)

distances = []

# comparing test user & reference user
for index, user in reference_users.iterrows():

	distance = calculate_distance(test_user, user)
	if distance is not None:
		distances.append((index, distance))

# sort - smallest first
distances.sort(key=lambda x: x[1])

# top closest users
top_five = distances[:5]

print("\nTop 5 simular Users: ")
for user_index, distance in top_five:
	print("User: ", user_index, "Distance: ", distance)
# print("Total Users: ", len(reference_users) - len(test_users))