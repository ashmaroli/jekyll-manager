# frozen_string_literal: true

Gem::Specification.new do |s|
  s.name        = "test-theme"
  s.version     = "0.1.0"
  s.license     = "MIT"
  s.summary     = "This is a theme used to test Jekyll Manager."
  s.description = "A gem-based Jekyll theme originally used at jekyll/jekyll " \
                  "repository for testing purposes has been slightly modified " \
                  "for testing this fork of jekyll/jekyll-admin"
  s.authors     = ["Jekyll"]
  s.files       = Dir.glob("#{__dir__}/**/*")
  s.homepage    = "https://github.com/ashmaroli/jekyll-manager"
end
