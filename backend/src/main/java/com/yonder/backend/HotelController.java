package com.yonder.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import io.github.cdimascio.dotenv.Dotenv;

/**
 * a) Class name: HotelController
 * b) Date: 10/26/2026
 * c) Programmer: Alejandro Rivera
 * d) Description: Gets hotels for the Maps page from the SerpApi Google Hotels API.
 *    Keeps the SerpApi key on the server so it is not in React.
 * e) Important functions:
 *    getHotels(q, check_in_date, check_out_date)
 *      Input: search text, check-in date, check-out date
 *      Output: hotel results as a JSON string
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HotelController {

    // get the serpapi key from backend/.env
    String apiKey = Dotenv.configure().ignoreIfMissing().load().get("SERPAPI_KEY");

    // runs when react goes to /api/hotels
    @GetMapping("/api/hotels")
    public String getHotels(@RequestParam String q,
                            @RequestParam String check_in_date,
                            @RequestParam String check_out_date) {

        // make the serpapi link
        String url = "https://serpapi.com/search.json?engine=google_hotels&currency=USD&gl=us&hl=en"
                + "&q=" + q
                + "&check_in_date=" + check_in_date
                + "&check_out_date=" + check_out_date
                + "&api_key=" + apiKey;

        // ask serpapi for the hotels
        String hotels = RestClient.create().get().uri(url).retrieve().body(String.class);

        // send the hotels back to react
        return hotels;
    }
}
