package com.yonder.backend.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yonder.backend.services.HotelService;

/**
 * Class name: HotelController
 * Date: 10/26/2026
 * Programmer: Alejandro Rivera
 *
 * Description: Gives the Maps page its hotels through GET /api/hotels.
 * This controller only handles the request. The SerpApi (Google Hotels)
 * call is done in HotelService.java, so the key stays on the server
 * and is not in React.
 *
 * Functions:
 * - getHotels(q, check_in_date, check_out_date): Accepts the search text
 *   and the check-in and check-out dates (like "2026-11-20"); returns the
 *   hotel results as a JSON string.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HotelController {

    private final HotelService hotelService;

    // spring gives us the HotelService
    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    // runs when react goes to /api/hotels
    @GetMapping("/api/hotels")
    public String getHotels(@RequestParam String q,
                            @RequestParam String check_in_date,
                            @RequestParam String check_out_date) {

        // let the service get the hotels and send them back to react
        return hotelService.getHotels(q, check_in_date, check_out_date);
    }
}
