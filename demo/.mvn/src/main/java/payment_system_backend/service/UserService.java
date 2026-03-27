package payment_system_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import payment_system_backend.model.User;
import payment_system_backend.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        // Check if email is already registered
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already registered. Please use a different email.");
        }

        user.setBalance(0); // default wallet balance
        return userRepository.save(user);
    }
}
