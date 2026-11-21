package com.yonder.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.yonder.backend.services.JwtService;

@SpringBootTest(properties = {
        "security.jwt.enabled=true",
        "security.jwt.secret-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "security.jwt.expiration-time=3600000"
})
@AutoConfigureMockMvc
class JwtSecurityIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    void protectedEndpointRejectsRequestWithoutToken() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointAcceptsValidBearerToken() throws Exception {
        String token = jwtService.generateToken("test@example.com");

        mockMvc.perform(get("/api/test").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello from Java!"));
    }

    @Test
    void openApiDescribesBearerAuthForProtectedEndpointsOnly() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"))
                .andExpect(jsonPath("$.paths['/api/test'].get.security[0].bearerAuth").exists())
                .andExpect(jsonPath("$.paths['/api/auth/login'].post.security").doesNotExist());
    }
}
