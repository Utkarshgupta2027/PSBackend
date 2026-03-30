package payment_system_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    // Set ALLOWED_ORIGINS env var in Railway to your Vercel URL
    // e.g. ALLOWED_ORIGINS=https://payflow.vercel.app,http://localhost:3000
    @Value("${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}")
    private String allowedOriginsRaw;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Parse comma-separated origins from env var
        List<String> origins = Arrays.asList(allowedOriginsRaw.split(","));
        config.setAllowedOriginPatterns(List.of("*")); // Allow all in dev, restrict via env in prod
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
