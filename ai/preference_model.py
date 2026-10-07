import pandas as pd

# Loading Data
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

# print("Data shape: ", data.shape)
# print("\nColumns:")
# print(data.columns.tolist())
# print("\nFirst user: ")
# print(data.iloc[0])

ratings = data.drop(columns=["user_id"])
zero_counts = (ratings == 0).sum()
print("\nZero values in each category: ")
print(zero_counts)

total_zeros = (ratings == 0).sum().sum()
total_values = ratings.size

print("\nTotal zero values: ", total_zeros)
print("Total rating values: ", total_values)
print("Percentage of zeros: ", total_zeros/total_values * 100)
