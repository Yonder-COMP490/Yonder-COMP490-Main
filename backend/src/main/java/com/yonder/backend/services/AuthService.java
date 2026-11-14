package com.yonder.backend.services;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yonder.backend.dto.AuthResponse;
import com.yonder.backend.dto.LoginRequest;
import com.yonder.backend.dto.RegisterRequest;
import com.yonder.backend.models.Profile;
import com.yonder.backend.models.User;
import com.yonder.backend.repositories.ProfileRepository;
import com.yonder.backend.repositories.UserRepository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Class name: AuthService
 * Date: 10/21/2026
 * Programmer: Christian Bartle
 *
 * Description: Handles user registration and login, including checking
 * credentials and encoding passwords. Uses UserRepository.java to access user
 * records in the database, and it uses ProfileRepository.java to create a profile
 * entry in the profile table when creating a user.
 *
 * Functions:
 * - register(RegisterRequest): Accepts registration details, checks that the
 *   email is present and not already registered, encodes the password, saves
 *   the user, and returns an AuthResponse with the result, user ID, and
 *   creation timestamp. It also creates an entry in the profile table, as each user
 *   has their own profile. Throws IllegalArgumentException for a missing or
 *   already-used email. We will most likely remove the creation timestamp from the
 *   response, as it is not needed by the front end; it was just for testing.
 *
 * - login(LoginRequest): Accepts an email and password, looks up the user,
 *   verifies the password against its stored hash, and returns an
 *   AuthResponse on success. Throws IllegalArgumentException if the user
 *   is not in the User table (no existing user with the email)
 *   or if the password does not match with the stored hash.
 *
 * Data structures: Uses RegisterRequest and LoginRequest, DTOs (Data Transfer
 * Objects) for input, User for user data, and AuthResponse for output.
 * userRepository returns an {@code Optional<User>} when searching by email.
 *
 * Algorithm:
 * - Registration checks if a user entered an email and whether it is a duplicate
 *   (if it already exists in the database). If the email is valid and not in the
 *   database, it then creates a new User object, sets the email and password hash,
 *   and saves it to the database, returning an AuthResponse with the result.
 *   The password is encoded using hashing before saving it to the database,
 *   so the original password is not stored.
 *   When creating a User, we also create a profile, even though most fields are
 *   empty because the user is not asked to create their profile yet. This ensures
 *   each user in the database has a corresponding profile row, linked using the
 *   user's ID as a foreign key.
 *
 * - Login retrieves the user and asks PasswordEncoder to compare the submitted
 *   password with the stored hash; the password is never compared or stored
 *   as plaintext.
 *   Currently, it returns an AuthResponse with the result, user ID, and creation
 *   timestamp, but ideally it should only return the result, user ID, and an
 *   authentication token. The creation timestamp is not needed by the front end
 *   and was only included for testing. Authentication tokens are yet to be
 *   implemented.
 */

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder encryptPassword;

    public AuthService(UserRepository userRepository, ProfileRepository profileRepository,
            PasswordEncoder encryptPassword) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.encryptPassword = encryptPassword;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request){
        if(request.getEmail() == null || request.getEmail().isBlank()){
            throw new IllegalArgumentException("Email is requiered");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new IllegalArgumentException("Email already in use.");
        }

        //if the email isnt empty nor its on use, then the user gets created. Perhaps later we add a add a verification code to be sent to the email in question to complete registration.

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(encryptPassword.encode(request.getPassword()));
        user = userRepository.save(user);

        //When a user is created, a profile should also be created for that user and introduced into the database profile table. Since the registration doesnt ask for any profile related information, the profile object is created with most fields null exept for the UserId.
        Profile profile = new Profile(user.getUserId(), null, null, null, null);
        profileRepository.save(profile);

        return new AuthResponse("User Successfully registered", user.getUserId(), user.getCreatedAt()); //Created at on the return is just for testing purposes
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new IllegalArgumentException("Invalid password and/or username"));

        if(!encryptPassword.matches(request.getPassword(), user.getPasswordHash())){
            throw new IllegalArgumentException("Invalid password and/or username");
        }
        return new AuthResponse("Login successfull", user.getUserId(), user.getCreatedAt());

    }
}