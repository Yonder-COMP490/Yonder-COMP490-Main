package com.yonder.backend.services;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Class name: HotelService
 * Date: 11/18/2026
 * Programmer: Alejandro Rivera
 *
 * Description: Gets hotels for the Maps page from the SerpApi Google Hotels
 * API. The SerpApi key comes from SERPAPI_KEY in backend/.env (loaded through
 * application.properties as serpapi.key), so it never goes to React.
 *
 * Functions:
 * - getHotels(query, checkIn, checkOut): Accepts the search text and the
 *   check-in and check-out dates (like "2026-11-20"); returns the SerpApi
 *   hotel results as a JSON string. If the key is missing, returns
 *   {"error": "..."} so the Maps page can show the problem.
 */
@Service
public class HotelService {

    private static final String SERPAPI_URL = "https://serpapi.com/search.json";

    private final String apiKey;
    private final RestClient restClient = RestClient.create();

    // spring fills in the key from application.properties (blank if missing)
    public HotelService(@Value("${serpapi.key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public String getHotels(String query, String checkIn, String checkOut) {
        // no key means serpapi would say no, so tell the maps page why
        if (apiKey == null || apiKey.isBlank()) {
            return "{\"error\":\"SERPAPI_KEY is missing from backend/.env\"}";
        }

        // make the serpapi link (encode turns spaces and & into safe characters)
        URI url = UriComponentsBuilder.fromUriString(SERPAPI_URL)
                .queryParam("engine", "google_hotels")
                .queryParam("currency", "USD")
                .queryParam("gl", "us")
                .queryParam("hl", "en")
                .queryParam("q", query)
                .queryParam("check_in_date", checkIn)
                .queryParam("check_out_date", checkOut)
                .queryParam("api_key", apiKey)
                .encode()
                .build()
                .toUri();

        // ask serpapi for the hotels and send back what it says
        return restClient.get().uri(url).retrieve().body(String.class);
    }
}
