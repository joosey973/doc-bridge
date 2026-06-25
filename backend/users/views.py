from django.views.generic import CreateView
from django.urls import reverse_lazy
from users.forms import CustomUserCreationForm, CustomAuthenticationForm


class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy('pastes:login')
    template_name = 'registration/signup.html'


class SignInView(CreateView):
    form_class = CustomAuthenticationForm
    success_url = reverse_lazy('pastes:pastes_page')
    template_name = 'registration/signin.html'