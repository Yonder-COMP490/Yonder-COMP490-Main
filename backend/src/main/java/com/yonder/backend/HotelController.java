package com.yonder.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import io.github.cdimascio.dotenv.Dotenv;

// gets hotels for the maps page
// the serpapi key stays here so it's not in react
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
